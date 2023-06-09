<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { FS, FileTypes, type FSDirectory, type FSFile, getFileTypeIcon, creatableFileTypes } from "../../FileSystem";
  import { openContextMenu, type IMenuOption } from "../../ContextMenu";
  import Icon from '@iconify/svelte';
  import { createToast } from "../../ToastManager";
  import { ToastPosition, ToastType } from "../../Types";
  import { elementReferenceTable, getElementFromDomElement, registerElement, unregisterElement } from "../../main";
  import { get_current_component } from "svelte/internal";
  import type ExplorerChild from "./ExplorerChild.svelte";
  import { clearProperties, getPropertiesOfFile, setProperties } from "../../PropertiesSystem";
  import { openTabs, rootScene } from "../../globals";
  import { showUploadWindow } from "../../UploadPopoverManager";
  import { addFilesToDirectory } from "../../Utils";

    export let directory: FSDirectory = undefined;
    export let file: FSFile = undefined;
    export let indent = 0;
    
    let myself = get_current_component();

    let container: HTMLDivElement;
    let directoryElement: HTMLDivElement;
    let fileElement: HTMLDivElement;
    let childrenElements: Array<ExplorerChild> | any = [];
    let inputElement: HTMLInputElement;

    let renaming = false;
    let selected = false;
    let name = "";
    let oldParent;

    let dragging = false;
    let possibleDragging = false;
    let rootScenePath: string;

    rootScene.subscribe((value)=>{
        rootScenePath = value;
    })

    let position: {x: number, y: number} = {x: 0, y: 0};

    let color = indent % 2 === 0 ? "--foreground-color" : "--midground-color";

    let contextMenuOptions: Array<IMenuOption> = [
        {label: "New", action: ()=>{}, avalableCheck: ()=>true, subMenuOptions: [
            {label: "Folder", action: newFolder, avalableCheck: ()=>true, icon: "material-symbols:folder-outline"},
        ], icon: "mdi-plus"},
        {label: "Rename", action: startRename, avalableCheck: ()=>true, icon: "mdi-rename"},
        {label: "Duplicate", action: duplicate, avalableCheck: ()=>true, icon:"mdi-content-duplicate"},
        {label: "Delete", action: remove, avalableCheck: ()=>true, icon: "mdi-trash-can-outline"},
        {label: "Upload File", action: ()=>{showUploadWindow(FS.getPath((file == undefined) ? directory : file))}, avalableCheck: ()=>true, icon: "mdi-upload"},
    ]

    // foreach fileType, add a new menu option
    for (let _ of creatableFileTypes){
        let fileType = _ as FileTypes; // gotta love typescript
        contextMenuOptions[0].subMenuOptions.push({label: fileType, action: ()=>{newFileOfType(fileType)}, avalableCheck: ()=>true, icon: getFileTypeIcon(fileType)})
    }

    let showChildren = directory ? directory.open : false;
    let showIndicator = false;

    function newFileOfType(type: FileTypes){

        let dir = (directory) ? directory : file.parent;

        let path = FS.getPath(dir);

        FS.addFile(path, {fileType: type, type: "file", name: `new ${type}`, content: {}, parent: dir, renaming: true, components: []});

        // if dir not toggled, toggle it
        setShowChildren(true);
    }

    function startRename(){
        renaming = true;

        setTimeout(()=>{
            inputElement.focus();
            inputElement.select();
        }, 0)
    }

    export function showMoveIndicator(){
        // console.log("showing indicator")
        showIndicator = true;
    }

    export function hideMoveIndicator(){
        showIndicator = false;
    }

    export function getPath(){
        return FS.getPath((directory) ? directory : file);
    }

    function newFolder(){

        let dir = (directory) ? directory : file.parent;

        let path = FS.getPath(dir);

        console.log(path)
        console.log(dir)

        FS.addDir(path, {type: "directory", name: "new folder", parent: dir, children: [], renaming: true});

        // if dir not toggled, toggle it
        setShowChildren(true);
    }

    function rename(){

        let dirOrFile = (directory) ? directory : file;
        let dirOrFilePath = FS.getPath(dirOrFile);

        FS.setRenaming(dirOrFilePath, false);

        if (name === ""){
            renaming = false;

            createToast("Name cannot be empty", ToastType.Error, ToastPosition.BottomRight);

            return;
        }

        let fileordir = (directory) ? directory : file;
        console.log(fileordir)
        let path = FS.getPath(fileordir);

        FS.rename(path, name);

        renaming = false;
    }

    function remove(){
            
            let fileordir = (directory) ? directory : file;
            let path = FS.getPath(fileordir);
    
            FS.delete(path);
    }

    function duplicate(){
        let fileordir = (directory) ? directory : file;
        let path = FS.getPath(fileordir);

        FS.duplicate(path);
    }

    function toggleShow(){        
        setShowChildren(!showChildren);
    }

    export function setShowChildren(show: boolean){
        if (!directory) return;
        showChildren = show;

        let path = FS.getPath(directory);
        FS.setOpen(path, showChildren);
    }

    onMount(()=>{

        //register elements as myself
        registerElement(container, myself);
        registerElement(fileElement, myself);
        registerElement(directoryElement, myself);

        container.addEventListener("contextmenu", onContextMenu)
        container.addEventListener("mousedown", (event)=>{
            if (event.button !== 0) return;

            if (event.target === container || event.target === fileElement || event.target === directoryElement){
                possibleDragging = true;
                event.preventDefault();
            }
        })

        container.addEventListener("click", (event)=>{
            if (event.button !== 0) return;

            if ((event.target === container || event.target === fileElement) && file){
                selected = true;
                
                setProperties(getPropertiesOfFile(file), file);
                
            }
        })

        window.addEventListener("mousemove", (event)=>{

            if (!possibleDragging)
                return;

            if ((Math.abs(event.movementX) > 0.1 || Math.abs(event.movementY) > 0.1) && !dragging){
                dragging = true;

                oldParent = container.parentElement;
                console.log("oldparent", oldParent)

                // set parent to #body
                console.log("setting parent to body")
                container.parentElement.removeChild(container);
                document.body.appendChild(container);

                showChildren = false;
            }


            if (dragging){
                position.x = event.clientX;
                position.y = event.clientY;

                container.style.left = `${position.x}px`;
                container.style.top = `${position.y}px`;
                container.style.minWidth = ""

                let target = event.target as HTMLElement;

                if (target.classList.contains("directory") || target.classList.contains("file") || target.classList.contains("container") || target.classList.contains("explorer-root")){
                    // get the element
                    let explorerChild: ExplorerChild = getElementFromDomElement(target)

                    hideAllIndicators();
                    explorerChild.showMoveIndicator();
                    hideMoveIndicator();
                }
            }
                   
        })

        window.addEventListener("mouseup", (event)=>{

            let inExplorer = false;
            let parentElement = event.target as HTMLElement;
            while (parentElement){
                if (parentElement.classList.contains("explorer-root")){
                    inExplorer = true;
                    break;
                }
                parentElement = parentElement.parentElement;
            }

            // if we are selecting and the mouse is up and it is within the explorer, then we are not selecting anymore
            if (selected && inExplorer){
                selected = false;
                clearProperties();
            }
        
            if (!possibleDragging)
                return;
            
            possibleDragging = false;

            if (dragging){
                dragging = false;
                container.setAttribute("style", calcStyle());
                
                console.log(event.target)

                hideAllIndicators();

                let target = event.target as HTMLElement;

                let targetElement = getElementFromDomElement(target);

                oldParent.appendChild(container);

                if (targetElement && targetElement.onFileDrop){
                    targetElement.onFileDrop((directory) ? directory : file, {x: event.clientX, y: event.clientY});
                }
                
            }
        })

        let dirOrFile = (directory) ? directory : file;
        if (dirOrFile.renaming){
            startRename();
        }
    })

    export function onFileDrop(file: FSFile | FSDirectory){
        setShowChildren(true);

        FS.move(FS.getPath(file), getPath());
    }

    onDestroy(()=>{
        console.log("ondestroy", (directory) ? "directory " + directory.name : "file " + file.name)
        // container.removeEventListener("contextmenu", onContextMenu)

        unregisterElement(container);
        unregisterElement(fileElement);
        unregisterElement(directoryElement);
    })

    function _destroy(){

        // foreach child, destroy
        childrenElements.forEach((child)=>{

            if (!child._destroy){
                console.warn("child._destroy is null", child)
                return;
            }

            child._destroy();
        })

        // destroy container
        container.parentElement.removeChild(container);

        // unregister elements
        unregisterElement(container);
        unregisterElement(fileElement);
        unregisterElement(directoryElement);
    }

    function hideAllIndicators(){
        // itterate thru all registered elements and if the element's classList has .container then hide the indicator
        elementReferenceTable.forEach((_class, element)=>{
            if (element && element.classList){
                if (element.classList.contains("container") || element.classList.contains("explorer-root")){
                    let explorerChild: ExplorerChild = _class;

                    if (!explorerChild){
                        console.log("explorerChild is null")
                        unregisterElement(element);
                        return;
                    }

                    if (!explorerChild.hideMoveIndicator){
                        // console.log("explorerChild.hideMoveIndicator is null?", explorerChild)
                        // unregisterElement(element);
                        return;
                    }
                    explorerChild.hideMoveIndicator();
                }
            }  
        })
    }

    function onContextMenu(event){

        if (event.target !== directoryElement && event.target !== fileElement && event.target !== container){
            console.log(event.target);
            return;
        }

        openContextMenu(event.clientX, event.clientY, contextMenuOptions)

        event.preventDefault();
    }

    function calcStyle(){
        return `margin-left: ${indent*10}px; background-color: var(${color}); min-width: calc(100% - ${indent*10}px);`
    }

    function openFileInWorkspace(){
        openTabs.update((tabs)=>{
            
            // if the file is already open, then just return
            for (let i = 0; i < tabs.length; i++){
                if (tabs[i].file === getPath()){
                    return tabs;
                }
            }

            tabs.push({
                file: getPath(),
                type: file.fileType
            })
            return tabs;
        })
    }

    function onDrop(event){
        // get files dropped
        let files = event.dataTransfer.files;

        event.preventDefault();

        // if there are no files, then return
        if (files.length === 0)
            return;

        addFilesToDirectory(files, getPath());
    }

    function onDragOver(event){
        event.preventDefault();
        selected = true;
    }

    function onDragLeave(event){
        selected = false;
    }

    function showSceneOrderMenu(event: MouseEvent){
        let menuOptions: Array<IMenuOption> = [
            {
                label: "Make Root",
                action: ()=>{
                    rootScene.update((rootScene)=>{
                        rootScene = getPath();
                        return rootScene;
                    })
                },
                avalableCheck: ()=>{
                    return rootScenePath !== getPath();
                },
                icon: "mdi-home"
            },
        ];
        
        openContextMenu(event.clientX, event.clientY, menuOptions);   
    }
</script>



<div class="container" style={calcStyle()} bind:this={container} class:dragging={dragging} class:indicator-shown={showIndicator} class:selected={selected} on:dragover={onDragOver} on:drop={onDrop} on:dragleave={onDragLeave}>
    {#if directory && !renaming}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="directory" on:click={toggleShow} bind:this={directoryElement}>

            <div class="arrow" class:visible={!showChildren}>
                <!-- <span class="iconify icon" data-icon="mdi-menu-right"></span> -->
                <Icon icon="mdi-menu-right" class="icon" />
            </div>
            <div class="arrow" class:visible={showChildren}>
                <!-- <span class="iconify icon" data-icon="mdi-menu-down"></span> -->
                <Icon icon="mdi-menu-down" class="icon" />
            </div>

            {#if showChildren}
                <Icon icon="material-symbols:folder-outline" class="icon"/>
            {:else}
                <Icon icon="material-symbols:folder" class="icon"/>
            {/if}

            <h3>
                {directory.name}
            </h3>

           
        </div>

        
        <div class="children" class:visible={showChildren && directory.children.length > 0}>
            {#each directory.children as child, i}
                {#if child.type === "file"}
                    <svelte:self file={child} indent={indent+1} bind:this={childrenElements[i]}/>
                {:else}
                    <svelte:self directory={child} indent={indent+1} bind:this={childrenElements[i]}/>
                {/if}
            {/each}
        </div>
        
    {:else if file && !renaming}
        <div class="file" bind:this={fileElement} on:dblclick={openFileInWorkspace}>
            <div class="icon-name-wrapper">
                <Icon icon={getFileTypeIcon(file.fileType)} class="icon"/>
                <h3>{file.name}</h3>
            </div>
            
            {#if file.fileType == FileTypes.scene}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="scene-order-button" on:click={showSceneOrderMenu}>
                    {#if rootScenePath !== getPath()}
                        <Icon icon="mdi-dots-grid" class="icon"/>
                    {:else}
                        <Icon icon="mdi-home" class="icon"/>
                    {/if}
                </div>
            {/if}
            <!-- <div class="sep"></div> -->
        </div>
    {/if}
    <div class="hidden rename-container" class:visible={renaming}> 
        {#if directory}
            <Icon icon="material-symbols:folder-outline" class="icon"/>
        {:else}
            <Icon icon={getFileTypeIcon(file.fileType)} class="icon"/>
        {/if}

        <input type="text" class="rename"
        value={(file) ? file.name : directory.name} on:input={e=>{
            // @ts-ignore
            name = e.target.value;
        }} 

        on:keypress={(event)=>{
            if (event.key === "Enter"){
                // @ts-ignore
                name = event.target.value;
                rename();
            }
        }} 
        on:blur={(event)=>{
            // @ts-ignore
            name = event.target.value;
            rename();
        }} 
        bind:this={inputElement}/>
    </div>
</div>



<style>

    .scene-order-button{
        cursor: pointer;
        height: 100%;
        display: flex;
        align-items: center;
    }

    .icon-name-wrapper{
        display: flex;
        flex-direction: row;
        gap:5px;
        user-select: none;
        pointer-events: none;
    }

    .selected{
        outline: 1px solid var(--highlight-color);
    }

    .rename-container{
        flex-direction: row;
        align-items: center;
        gap: 5px;
    }

    .hidden{
        display: none;
    }

    .indicator-shown{
        outline: 1px solid var(--highlight-color);
    }

    .dragging{
        position: absolute;
        opacity: 0.6;
        width: 10rem;
        z-index: 500;
        transform: translate(-50%, -50%);

        pointer-events: none !important;
    }

    .rename{
        background-color: transparent;
        border: none;
        border-bottom: 1px solid var(--text-color);
        color: var(--text-color);
        font-size: 0.7em;
        outline: none;
        padding: 0;
        margin: 0;
        width: 100%;

        font-family: var(--font-family);
        /* pointer-events: all !important;
        user-select: all !important; */
    }

    .file{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .arrow{
        display: none;
        pointer-events: none;
    }

    .container{

        border-radius: var(--general-border-radius);

        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 5px;
        width: fit-content;
    }

    .directory{
        display: flex;
        flex-direction: row;
        gap: 5px;
        align-items: center;
        cursor: pointer;
    }

    h3{
        color: var(--text-color);
        font-size: 0.7em;
        margin: 0;

        pointer-events: none;
    }

    .visible {
        display: flex !important;
    }

    .children{

        display: none;
        flex-direction: column;
        gap: 5px;
    }
</style>