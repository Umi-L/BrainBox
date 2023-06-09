import { print, moveBy, moveTo, rotateTo, rotateBy, sizeBy, sizeTo, random, isKeyPressed } from "./API"
import type { FSFile } from "./FileSystem"
import { Template } from "./Templates"
import type ObjectDisplay from "./lib/Components/Editors/SceneEditorComponents/ObjectDisplay.svelte"

export interface Point {
    x: number
    y: number

    name?: string
}

export interface ISceneObject{
    object: string,
    position: {
        x: number,
        y: number
    },
    rotation: number,
    scale: {
        width: number,
        height: number
    },
    displayObject: ObjectDisplay
}

export interface SceneFileContent{
    objects: Array<ISceneObject>,
    backgroundColor: string
}

export interface ScriptFileContent{
    code: string
}

export interface FlowchartFileContent{
    nodes: Array<SavedNode>,
    connections: Array<SavedConnection>,
    extenderPosition: {x: string, y: string},
    localVariables: Array<string>,
    compiledCode?: string,
}

export interface Frame{
    path: string;
}
export interface SpriteFileContent{
    frames: Array<Frame>;
}


export interface ScriptData {
    content: string
}

export interface SavedNode {
    type: NodeData,
    pos: {x: number, y: number},
    literals: Array<string>
}

export interface SavedConnection {
    from: {
        node: number,
        outputNumber: number
    },
    to: {
        node: number,
        inputNumber: number
    }
}

export enum PropertyTypes {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Vector2 = "vector2",
    Array = "array",
    Sprite = "sprite",
    Image = "image",
}

export enum TestPropTypes {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Choice = 'choice',
}

export interface NodeInterface {
    name: string
    inputs: Point[]
    outputs: Point[]
}

export enum ToastType {
    Success = 'success',
    Error = 'error',
    Info = 'info',
    Warning = 'warning',
}

export enum ToastPosition {
    TopLeft = 'top-left',
    TopRight = 'top-right',
    BottomLeft = 'bottom-left',
    BottomRight = 'bottom-right',
}


export enum FlowDataType {
    Flow = 'flow',
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Object = 'object',
    Array = 'array',
    Any = 'any',
    Vector2 = "vector2",
}
export enum FlowLiteralType {
    String = 'text',
    Number = 'number',
    Boolean = 'checkbox',
    Variable = 'variable',
}


export enum NodeCatagories {
    Control = 'control',
    Operators = 'operators',
    literals = 'literals',
    Events = 'events',
    debug = 'debug',
    Movement = 'movement',
    Variables = 'variables',
    Input = "input"
}

export interface NodeDefs {
  [key: string]: {
    name: string;
    inputs: IOPoint[];
    outputs: IOPoint[];
    literals: LiteralInput[];
    func?: Function;
    specialCase?: boolean;
    template?: Template;
    category: NodeCatagories;
    parameters?: Array<NodeParameter>;
  };
}

export interface NodeParameter {
    label: string;
    outputNumber: number;
}

export interface NodeData {
  name: string;
  inputs: IOPoint[];
  outputs: IOPoint[];
  literals: LiteralInput[];
  func?: Function;
  specialCase?: boolean;
  template?: Template;
  category: NodeCatagories;
  parameters?: Array<NodeParameter>;
}

export interface IOPoint {
    label: string
    type: FlowDataType
}

export interface LiteralInput {
    label: string,
    type: FlowLiteralType,
}

export const NodeTypes: NodeDefs = {
    Start: {
        name: "start",
        inputs: [],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        template: new Template("function start(){{b1}}"),
        literals: [],
        category: NodeCatagories.Events,
    },
    Click: {
        name: "click",
        inputs: [],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        template: new Template("function click(){{b1}}"),
        literals: [],
        category: NodeCatagories.Events,
    },
    Update: {
        name: "update",
        inputs: [],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        template: new Template("function update(){{b1}}"),
        literals: [],
        category: NodeCatagories.Events,
    },
    KeyDown: {
        name: "key down",
        inputs: [],
        outputs: [
            { label: "out", type: FlowDataType.Flow },
            { label: "key", type: FlowDataType.String }
        ],
        template: new Template("function keyDown(key){{b1}}"),
        literals: [],
        parameters: [
            {label: "key", outputNumber: 1}
        ],
        category: NodeCatagories.Events,
    },
    KeyUp: {
        name: "key up",
        inputs: [],
        outputs: [
            { label: "out", type: FlowDataType.Flow },
            { label: "key", type: FlowDataType.String }
        ],
        template: new Template("function keyUp(key){{b1}}"),
        literals: [],
        parameters: [
            {label: "key", outputNumber: 1}
        ],
        category: NodeCatagories.Events,
    },
    MoveTo: {
        name: "move to",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "x", type: FlowDataType.Number },
            { label: "y", type: FlowDataType.Number },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [],
        func: moveTo,
        category: NodeCatagories.Movement,
    },
    MoveBy: {
        name: "move by",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "x", type: FlowDataType.Number },
            { label: "y", type: FlowDataType.Number },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [],
        func: moveBy,
        category: NodeCatagories.Movement,
    },
    RotateTo: {
        name: "rotate to",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "angle", type: FlowDataType.Number },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [],
        func: rotateTo,
        category: NodeCatagories.Movement,
    },
    RotateBy: {
        name: "rotate by",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "angle", type: FlowDataType.Number },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [],
        func: rotateBy,
        category: NodeCatagories.Movement,
    },
    SizeTo: {
        name: "size to",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "x", type: FlowDataType.Number },
            { label: "y", type: FlowDataType.Number },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [],
        func: sizeTo,
        category: NodeCatagories.Movement,
    },
    SizeBy: {
        name: "scale by",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "x", type: FlowDataType.Number },
            { label: "y", type: FlowDataType.Number },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [],
        func: sizeBy,
        category: NodeCatagories.Movement,
    },
    isKeyPressed: {
        name: "is key pressed",
        inputs: [
            { label: "key", type: FlowDataType.String },
        ],
        outputs: [{ label: "is pressed", type: FlowDataType.Boolean }],
        literals: [],
        func: isKeyPressed,
        category: NodeCatagories.Input,
    },
    Random: {
        name: "random",
        inputs: [
            { label: "min", type: FlowDataType.Number },
            { label: "max", type: FlowDataType.Number },
        ],
        outputs: [{ label: "out", type: FlowDataType.Number }],
        literals: [],
        func: random,
        category: NodeCatagories.Operators,
    },
    If: {
        name: "if",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "condition", type: FlowDataType.Boolean },
        ],
        outputs: [
            { label: "true", type: FlowDataType.Flow },
            { label: "false", type: FlowDataType.Flow },
            { label: "out", type: FlowDataType.Flow },
        ],
        literals: [],
        specialCase: true,
        template: new Template("if({p1}){{b1}}else{{b2}}{b3}"),
        category: NodeCatagories.Control,
    },
    Log: {
        name: "print",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "message", type: FlowDataType.Any },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [],
        func: print,
        category: NodeCatagories.debug,
    },
    String: {
        name: "text",
        inputs: [],
        outputs: [{ label: "text", type: FlowDataType.String }],
        literals: [
            { label: "value", type: FlowLiteralType.String },
        ],
        specialCase: true,
        template: new Template("'{l1}'"),
        category: NodeCatagories.literals,
    },
    Number: {
        name: "number",
        inputs: [],
        outputs: [{ label: "number", type: FlowDataType.Number }],
        literals: [
            { label: "value", type: FlowLiteralType.Number },
        ],
        specialCase: true,
        template: new Template("{l1}"),
        category: NodeCatagories.literals,
    },
    Boolean: {
        name: "flag",
        inputs: [],
        outputs: [{ label: "flag", type: FlowDataType.Boolean }],
        literals: [
            { label: "value", type: FlowLiteralType.Boolean },
        ],
        specialCase: true,
        template: new Template("{l1}"),
        category: NodeCatagories.literals,
    },
    Equals: {
        name: "equals",
        inputs: [
            { label: "a", type: FlowDataType.Any },
            { label: "b", type: FlowDataType.Any },
        ],
        outputs: [{ label: "equals", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} == {p2}"),
        category: NodeCatagories.Operators,
    },
    Not: {
        name: "not",
        inputs: [
            { label: "value", type: FlowDataType.Boolean },
        ],
        outputs: [{ label: "not", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("!{p1}"),
        category: NodeCatagories.Operators,
    },
    And: {
        name: "and",
        inputs: [
            { label: "a", type: FlowDataType.Boolean },
            { label: "b", type: FlowDataType.Boolean },
        ],
        outputs: [{ label: "and", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} && {p2}"),
        category: NodeCatagories.Operators,
    },
    Or: {
        name: "or",
        inputs: [
            { label: "a", type: FlowDataType.Boolean },
            { label: "b", type: FlowDataType.Boolean },
        ],
        outputs: [{ label: "or", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} || {p2}"),
        category: NodeCatagories.Operators,
    },

    GreaterThan: {
        name: "greater than >",
        inputs: [
            { label: "a", type: FlowDataType.Number },
            { label: "b", type: FlowDataType.Number },
        ],
        outputs: [{ label: "greater than >", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} > {p2}"),
        category: NodeCatagories.Operators,
    },

    LessThan: {
        name: "less than <",
        inputs: [
            { label: "a", type: FlowDataType.Number },
            { label: "b", type: FlowDataType.Number },
        ],
        outputs: [{ label: "less than <", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} < {p2}"),
        category: NodeCatagories.Operators,
    },

    Repeat: {
        name: "repeat",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "times", type: FlowDataType.Number },
        ],
        outputs: [
            { label: "repeated", type: FlowDataType.Flow },
            { label: "out", type: FlowDataType.Flow },
        ],
        literals: [],
        specialCase: true,
        template: new Template("for(let i = 0; i < {p1}; i++){{b1}}{b2}"),
        category: NodeCatagories.Control,
    },
    Vector2: {
        name: "vector2",
        inputs: [],
        outputs: [{ label: "vector2", type: FlowDataType.Vector2 }],
        literals: [
            { label: "x", type: FlowLiteralType.Number },
            { label: "y", type: FlowLiteralType.Number },
        ],
        specialCase: true,
        template: new Template("new Vector2({l1}, {l2})"),
        category: NodeCatagories.literals,
    },
    Variable: {
        name: "variable",
        inputs: [],
        outputs: [{ label: "variable", type: FlowDataType.Any }],
        literals: [
            { label: "variable", type: FlowLiteralType.Variable },
        ],
        specialCase: true,
        template: new Template("{l1}"),
        category: NodeCatagories.Variables,
    },
    SetVariable: {
        name: "set variable",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "variable", type: FlowDataType.Any },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [
            { label: "variable", type: FlowLiteralType.Variable },
        ],
        specialCase: true,
        template: new Template("{l1} = {p1}"),
        category: NodeCatagories.Variables,
    },
};

