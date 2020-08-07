import { VM } from "./VM";
import { Player } from "./Player";
import { Enemy } from "./Enemy";

const DEBUG = !!process.argv[2];

const enum Instruction {
    INST_LITERAL,
    INST_ENTITY,
    INST_GET_ATTRIBUTE,
    INST_SET_ATTRIBUTE,
    INST_OPERATOR,
    INST_EQUAL,
    INST_COPY,
}
const enum Operator {
    ADD,
    SUB,
    MUL,
    DIV,
}
const enum Attribute {
    HP,
    X,
    Y,
    ATTACK,
    NAME,
}
const AttributeMap = {
    [Attribute.HP]: "hp",
    [Attribute.X]: "x",
    [Attribute.Y]: "y",
    [Attribute.ATTACK]: "attack",
    [Attribute.NAME]: "name",
}
const enum EntityIndex {
    Hero = 0,
    Enemy = 1,
}
const hero = new Player();
const enemy = new Enemy();
const getPlayer = (index: EntityIndex) => {
    return index === EntityIndex.Hero ? hero : enemy;
}
const runFunc = (bytes: Instruction[], vm: VM<Instruction>) => {
    for (let i = 0; i < bytes.length; i++) {
        const instruction = bytes[i];
        switch (instruction) {
            case Instruction.INST_ENTITY:
            case Instruction.INST_LITERAL: {
                const value = bytes[++i];
                vm.push(value);
            } break;
            case Instruction.INST_GET_ATTRIBUTE: {
                const entityIndex = vm.pop() as unknown as EntityIndex;
                const entity = getPlayer(entityIndex);
                const attribute = bytes[++i] as unknown as Attribute;
                let value: any;
                switch (attribute) {
                    case Attribute.X: {
                        value = entity.position.x;
                    } break;
                    case Attribute.Y: {
                        value = entity.position.y;
                    } break;
                    default: {
                        value = entity[AttributeMap[attribute]];
                    } break;
                }
                vm.push(value);
            } break;
            case Instruction.INST_SET_ATTRIBUTE: {
                const entityIndex = vm.pop() as unknown as EntityIndex;
                const value = vm.pop();
                const entity = getPlayer(entityIndex);
                const attribute = bytes[++i] as unknown as Attribute;
                switch (attribute) {
                    case Attribute.X: {
                        entity.position.x = value;
                    } break;
                    case Attribute.Y: {
                        entity.position.y = value;
                    } break;
                    default: {
                        entity[AttributeMap[attribute]] = value;
                    } break;
                }
            } break;
            case Instruction.INST_OPERATOR: {
                const operator = bytes[++i] as unknown as Operator;
                const y = vm.pop();
                const x = vm.pop();
                let value: number;
                switch (operator) {
                    case Operator.ADD: {
                        value = x + y;
                    } break;
                    case Operator.SUB: {
                        value = x - y;
                    } break;
                    case Operator.MUL: {
                        value = x * y;
                    } break;
                    case Operator.DIV: {
                        value = x / y;
                    } break;
                }
                vm.push(value);
            } break;
            case Instruction.INST_EQUAL: {
                const value = bytes[++i];
                // vm.print("BIDUI前 ");
                const current = vm.pop();
                // vm.print("BIDUI后 ");
                if (current !== value) {
                    console.error(`比对失败: 期望 ${value} , 实际 ${current}`);
                } else {
                    console.log(`比对成功: 值${value}`);
                }
            } break;
            case Instruction.INST_COPY: {
                // vm.print('copy ');
                vm.push(vm.getValue());
                // vm.print('copy ed');
            } break;
        }
    }
}
const setAttribute = (index: EntityIndex, attributeIndex: Attribute, attribute?: any): Instruction[] => {
    const bytes = [
        Instruction.INST_ENTITY, index,
        Instruction.INST_SET_ATTRIBUTE, attributeIndex,
    ];
    typeof attribute !== "undefined" && bytes.unshift(...literal(attribute));
    return bytes as unknown as Instruction[];
}
const getAttribute = (index: EntityIndex, attributeIndex: Attribute): Instruction[] => {
    return [
        Instruction.INST_ENTITY, index,
        Instruction.INST_GET_ATTRIBUTE, attributeIndex,
    ] as unknown as Instruction[]
}
const calculator = (operator: Operator, num?: number, base?: number) => {
    const bytes = [Instruction.INST_OPERATOR, operator];
    typeof num !== "undefined" && bytes.unshift(...literal(num));
    typeof base !== "undefined" && bytes.unshift(...literal(base));
    console.log(bytes);
    return bytes as unknown as Instruction[];
}
const move = (index: EntityIndex, x: number, y: number): Instruction[] => {
    return [
        ...setAttribute(index, Attribute.X, x),
        ...setAttribute(index, Attribute.Y, y),
    ]
}
const literal = (literal: Instruction): Instruction[] => {
    return [
        Instruction.INST_LITERAL, literal
    ]
}
const assert = (value = void 0, bytes: Instruction[] = [Instruction.INST_COPY]) => {
    return DEBUG ? [
        ...bytes,
        Instruction.INST_EQUAL, value
    ] as unknown as Instruction[] : []
}
const vm = new VM(runFunc);
const bytes = [];
const actions = [
    move(EntityIndex.Hero, -2, 1),
    assert(),
    setAttribute(EntityIndex.Hero, Attribute.HP, 100),
    assert(),
    setAttribute(EntityIndex.Enemy, Attribute.ATTACK, 5),
    assert(),
    getAttribute(EntityIndex.Hero, Attribute.HP),
    assert(100),
    getAttribute(EntityIndex.Enemy, Attribute.ATTACK),
    assert(5),
    calculator(Operator.SUB),
    assert(95),
    setAttribute(EntityIndex.Hero, Attribute.HP),
    assert(),
];
actions.forEach(act => {
    bytes.push(...act);
})
console.log(JSON.stringify(bytes));
vm.runCode(bytes);
vm.print();
console.log(getPlayer(EntityIndex.Enemy));
console.log(getPlayer(EntityIndex.Hero));
