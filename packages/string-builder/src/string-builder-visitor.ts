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

import { StringBuilder } from "./string-builder";
import { List } from "immutable";
import { Op } from "./op";

export abstract class StringBuilderVisitor {

    public static ofUnary(field: string, method: string): StringBuilderVisitor {
        return new StringBuilderVisitorUnary(false, field, method)
    }

    public static ofNumber(field: string, method: string, value: number): StringBuilderVisitor {
        return new StringBuilderVisitorNumber(false, field, method, value)
    }

    public static ofNumberList(field: string, method: string, value: List<number>): StringBuilderVisitor {
        return new StringBuilderVisitorNumberList(false, field, method, value)
    }

    public static ofString(field: string, method: string, value: string): StringBuilderVisitor {
        return new StringBuilderVisitorString(false, field, method, value)
    }

    public static ofStringList(field: string, method: string, value: List<string>): StringBuilderVisitor {
        return new StringBuilderVisitorStringList(false, field, method, value)
    }

    public static ofOp(left: StringBuilderVisitor, op: Op, right: StringBuilderVisitor) {
        return new StringBuilderVisitorOp(false, left, op, right)
    }

    public abstract not(): StringBuilderVisitor
    public abstract visit(builder: StringBuilder): void

}

class StringBuilderVisitorOp implements StringBuilderVisitor {

    private readonly precedences = new Map<Op, number>()

    constructor(
        private readonly negated: boolean,
        private readonly left: StringBuilderVisitor,
        private readonly op: Op,
        private readonly right: StringBuilderVisitor,
    ) {
        this.precedences.set(Op.OR, 1)
        this.precedences.set(Op.AND, 2)
    }

    private precedence(): number {
        return this.precedences.get(this.op)
    }

    private hasLowerPrecedence(other: StringBuilderVisitorOp): Boolean {
        return this.precedence() < other.precedence()
    }

    private hasLowerOrEqualPrecedence(other: StringBuilderVisitorOp): Boolean {
        return this.precedence() <= other.precedence()
    }

    public not(): StringBuilderVisitor {
        return new StringBuilderVisitorOp(!this.negated, this.left, this.op, this.right)
    }

    public visit(builder: StringBuilder): void {
        const groupThis = this.negated
        const groupLeft = this.left instanceof StringBuilderVisitorOp
            && !(this.left.negated) && this.left.hasLowerPrecedence(this)
        const groupRight = this.right instanceof StringBuilderVisitorOp
            && !(this.right.negated) && this.right.hasLowerOrEqualPrecedence(this)
        if (groupThis) {
            builder.beginExpression(this.negated)
        }
        if (groupLeft) {
            const left = this.left as StringBuilderVisitorOp
            builder.beginExpression(left.negated)
        }
        this.left.visit(builder)
        if (groupLeft) {
            builder.endExpression()
        }
        builder.appendOp(this.op)
        if (groupRight) {
            const right = this.right as StringBuilderVisitorOp
            builder.beginExpression(right.negated)
        }
        this.right.visit(builder)
        if (groupRight) {
            builder.endExpression()
        }
        if (groupThis) {
            builder.endExpression()
        }
    }

}

class StringBuilderVisitorUnary implements StringBuilderVisitor {
    constructor(private readonly negated: boolean, private readonly field: string, private readonly method: string) {}

    public not(): StringBuilderVisitor {
        return new StringBuilderVisitorUnary(!this.negated, this.field, this.method)
    }

    public visit(builder: StringBuilder): void {
        builder.appendUnaryCriteria(this.field, this.method, this.negated)
    }
}

class StringBuilderVisitorNumber implements StringBuilderVisitor {
    constructor(
        private readonly negated: boolean,
        private readonly field: string,
        private readonly method: string,
        private readonly value: number,
    ) {}

    public not(): StringBuilderVisitor {
        return new StringBuilderVisitorNumber(!this.negated, this.field, this.method, this.value)
    }

    public visit(builder: StringBuilder): void {
        builder.appendNumberCriteria(this.field, this.method, this.value, this.negated)
    }
}

class StringBuilderVisitorNumberList implements StringBuilderVisitor {
    constructor(
        private readonly negated: boolean,
        private readonly field: string,
        private readonly method: string,
        private readonly value: List<number>,
    ) {}

    public not(): StringBuilderVisitor {
        return new StringBuilderVisitorNumberList(!this.negated, this.field, this.method, this.value)
    }

    public visit(builder: StringBuilder): void {
        builder.appendNumberListCriteria(this.field, this.method, this.value, this.negated)
    }
}

class StringBuilderVisitorString implements StringBuilderVisitor {
    constructor(
        private readonly negated: boolean,
        private readonly field: string,
        private readonly method: string,
        private readonly value: string,
    ) {}

    public not(): StringBuilderVisitor {
        return new StringBuilderVisitorString(!this.negated, this.field, this.method, this.value)
    }

    public visit(builder: StringBuilder): void {
        builder.appendStringCriteria(this.field, this.method, this.value, this.negated)
    }
}

class StringBuilderVisitorStringList implements StringBuilderVisitor {
    constructor(
        private readonly negated: boolean,
        private readonly field: string,
        private readonly method: string,
        private readonly value: List<string>,
    ) {}

    public not(): StringBuilderVisitor {
        return new StringBuilderVisitorStringList(!this.negated, this.field, this.method, this.value)
    }

    public visit(builder: StringBuilder): void {
        builder.appendStringListCriteria(this.field, this.method, this.value, this.negated)
    }
}
