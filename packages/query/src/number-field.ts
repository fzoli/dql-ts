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

import { NumberField as NumberFieldApi } from "@dqljs/field";
import { Criteria } from "./criteria";
import { StringBuilderVisitor } from "@dqljs/string-builder";
import { Methods } from "./methods";
import { List } from "immutable";

export class NumberField implements NumberFieldApi {
    constructor(private readonly field: string) {}

    public isNotNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NOT_NULL))
    }

    public isNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NULL))
    }

    public eq(right: number): Criteria {
        return new Criteria(StringBuilderVisitor.ofNumber(this.field, Methods.EQ, right))
    }

    public gt(right: number): Criteria {
        return new Criteria(StringBuilderVisitor.ofNumber(this.field, Methods.GT, right))
    }

    public lt(right: number): Criteria {
        return new Criteria(StringBuilderVisitor.ofNumber(this.field, Methods.LT, right))
    }

    public goe(right: number): Criteria {
        return new Criteria(StringBuilderVisitor.ofNumber(this.field, Methods.GOE, right))
    }

    public loe(right: number): Criteria {
        return new Criteria(StringBuilderVisitor.ofNumber(this.field, Methods.LOE, right))
    }

    public memberOf(right: List<number>): Criteria {
        return new Criteria(StringBuilderVisitor.ofNumberList(this.field, Methods.MEMBER_OF, right))
    }
}
