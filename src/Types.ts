import { specialCaseEquals, specialCaseIf, specialCaseNot } from "./Compiler"
import { log } from "./NodeFunctions"

export interface Point {
    x: number
    y: number

    name?: string
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
}
export enum FlowLiteralType {
    String = 'text',
    Number = 'number',
    Boolean = 'checkbox',
}

// export enum NodeType {
//     Start = 'start',
//     If = 'if',
//     Log = 'log',
// }

export interface NodeDefs {
    [key: string]: { name: string, inputs: IOPoint[], outputs: IOPoint[], literals: LiteralInput[], func: Function | undefined, specialCase?: boolean }
}

export interface NodeData {
  name: string, inputs: IOPoint[], outputs: IOPoint[], literals: LiteralInput[], func: Function | undefined, specialCase?: boolean
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
    literals: [],
    func: undefined
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
    ],
    literals: [],
    func: specialCaseIf,
    specialCase: true
  },

  Log: {
    name: "log",
    inputs: [
      { label: "in", type: FlowDataType.Flow },
      { label: "message", type: FlowDataType.Any },
    ],
    outputs: [{ label: "out", type: FlowDataType.Flow }],
    literals: [],
    func: log
  },
  String: {
    name: "string",
    inputs: [],
    outputs: [{ label: "string", type: FlowDataType.String }],
    literals: [
        { label: "value", type: FlowLiteralType.String },
    ],
    func: undefined
  },
    Number: {
        name: "number",
        inputs: [],
        outputs: [{ label: "number", type: FlowDataType.Number }],
        literals: [
            { label: "value", type: FlowLiteralType.Number },
        ],
        func: undefined
    },
    Boolean: {
        name: "boolean",
        inputs: [],
        outputs: [{ label: "boolean", type: FlowDataType.Boolean }],
        literals: [
            { label: "value", type: FlowLiteralType.Boolean },
        ],
        func: undefined
    },
    Equals: {
        name: "equals",
        inputs: [
            { label: "a", type: FlowDataType.Any },
            { label: "b", type: FlowDataType.Any },
        ],
        outputs: [{ label: "equals", type: FlowDataType.Boolean }],
        literals: [],
        func: specialCaseEquals,
        specialCase: true
    },
    Not: {
        name: "not",
        inputs: [
            { label: "value", type: FlowDataType.Boolean },
        ],
        outputs: [{ label: "not", type: FlowDataType.Boolean }],
        literals: [],
        func: specialCaseNot,
        specialCase: true
    }
};

