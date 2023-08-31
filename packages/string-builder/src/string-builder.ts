/*
 * Copyright 2023 Zoltan Farkas
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { List } from 'immutable'
import { Op } from "./op";

export class StringBuilder {
    private static readonly OP_AND = '&'
    private static readonly OP_OR = '|'
    private static readonly OP_NOT = '!'
    private static readonly DELIMITER_METHOD = ':'
    private static readonly DELIMITER_LIST_BEGIN = '['
    private static readonly DELIMITER_LIST_END = ']'
    private static readonly DELIMITER_EXPR_BEGIN = '('
    private static readonly DELIMITER_EXPR_END = ')'
    private static readonly DELIMITER_LIST_VALUE = ','

    private readonly partStack: StringBuilderPart[] = []
    private part = new StringBuilderPart()

    private constructor() {}

    public static builder(): StringBuilder {
        return new StringBuilder()
    }

    public build(): string {
        if (this.part.size === 0) {
            return ''
        }
        this.validateEnd()
        return this.part.toString()
    }

    public appendOp(op: Op): StringBuilder {
        this.checkOpPosition()
        switch (op) {
            case Op.AND:
                this.part.append(StringBuilder.OP_AND)
                break
            case Op.OR:
                this.part.append(StringBuilder.OP_OR)
                break
            default:
                throw Error('Unhandled OP: ' + op)
        }
        this.part.size++
        return this
    }

    public beginExpression(negated?: boolean): StringBuilder {
        this.checkExpressionPosition()
        this.appendNot(negated)
        this.part.append(StringBuilder.DELIMITER_EXPR_BEGIN)
        this.pushPart(this.part)
        this.part = new StringBuilderPart()
        return this
    }

    public endExpression(): StringBuilder {
        if (this.part.size === 0) {
            throw Error('Empty expression')
        }
        this.validateEnd()
        const text = this.part.toString()
        this.part = this.popPart()
        this.part.append(text)
        this.part.append(StringBuilder.DELIMITER_EXPR_END)
        this.part.size++
        return this
    }

    public appendUnaryCriteria(field: string, method: string, negated?: boolean): StringBuilder {
        this.validateField(field)
        this.validateMethod(method)
        this.checkCriteriaPosition()
        this.appendNot(negated)
        this.part.append(field)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(method)
        this.part.size++
        return this
    }

    public appendStringCriteria(field: string, method: string, value: string, negated?: boolean): StringBuilder {
        this.validateField(field)
        this.validateMethod(method)
        this.checkCriteriaPosition()
        this.appendNot(negated)
        this.part.append(field)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(method)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(JSON.stringify(value)) // escapes the string AND add the delimiters (") too
        this.part.size++
        return this
    }

    public appendNumberCriteria(field: string, method: string, value: number, negated?: boolean): StringBuilder {
        this.validateField(field)
        this.validateMethod(method)
        this.checkCriteriaPosition()
        this.appendNot(negated)
        this.part.append(field)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(method)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(Number(value).toString())
        this.part.size++
        return this
    }

    public appendNumberListCriteria(
        field: string,
        method: string,
        values: List<number>,
        negated?: boolean,
    ): StringBuilder {
        this.validateField(field)
        this.validateMethod(method)
        this.checkCriteriaPosition()
        this.appendNot(negated)
        this.part.append(field)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(method)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(StringBuilder.DELIMITER_LIST_BEGIN)
        this.part.append(values.join(StringBuilder.DELIMITER_LIST_VALUE))
        this.part.append(StringBuilder.DELIMITER_LIST_END)
        this.part.size++
        return this
    }

    public appendStringListCriteria(
        field: string,
        method: string,
        values: List<string>,
        negated?: boolean,
    ): StringBuilder {
        this.validateField(field)
        this.validateMethod(method)
        this.checkCriteriaPosition()
        this.appendNot(negated)
        this.part.append(field)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(method)
        this.part.append(StringBuilder.DELIMITER_METHOD)
        this.part.append(StringBuilder.DELIMITER_LIST_BEGIN)
        this.part.append(this.joinString(values))
        this.part.append(StringBuilder.DELIMITER_LIST_END)
        this.part.size++
        return this
    }

    private joinString(values: List<string>): string {
        const a: string[] = []
        values.toArray().forEach((value: string) => {
            a.push(JSON.stringify(value))
        })
        return a.join('')
    }

    private appendNot(negated?: boolean) {
        if (negated) {
            this.part.append(StringBuilder.OP_NOT)
        }
    }

    private popPart(): StringBuilderPart {
        const p = this.partStack.pop()
        if (p === undefined) {
            throw Error('Empty stack')
        }
        return p
    }

    private pushPart(p: StringBuilderPart) {
        this.partStack.push(p)
    }

    private checkExpressionPosition() {
        if (this.part.size % 2 !== 0) {
            throw Error('Expression is not expected')
        }
    }

    private checkCriteriaPosition() {
        if (this.part.size % 2 !== 0) {
            throw Error('Criteria is not expected')
        }
    }

    private checkOpPosition() {
        if (this.part.size % 2 === 0) {
            throw Error('OP is not expected')
        }
    }

    private validateEnd() {
        if (this.part.size % 2 === 0) {
            throw Error('OP at the end is not allowed')
        }
    }

    private validateField(field: string) {
        if (field.length === 0) {
            throw Error('Field can not be empty')
        }
    }

    private validateMethod(method: string) {
        if (method.length === 0) {
            throw Error('Method can not be empty')
        }
    }
}

class StringBuilderPart {
    private readonly _builderArray: string[] = []
    public size = 0

    public toString(): string {
        return this._builderArray.join('')
    }

    public append(text: string): StringBuilderPart {
        this._builderArray.push(text)
        return this
    }
}
