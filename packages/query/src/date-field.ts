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
import { DateField as DateFieldApi } from "@dqljs/field";
import { StringBuilderVisitor } from "@dqljs/string-builder";
import { List } from "immutable";
import { Criteria } from "./criteria";
import { Methods } from "./methods";

export class DateField implements DateFieldApi {
    constructor(private readonly field: string) {}

    private serialize(value: Date): string {
        return value.toISOString()
    }

    private serializeList(value: List<Date>): List<string> {
        return value.map((d) => this.serialize(d!)).toList()
    }

    public isNotNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NOT_NULL))
    }

    public isNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NULL))
    }

    public eq(right: Date): Criteria {
        return new Criteria(StringBuilderVisitor.ofString(this.field, Methods.EQ, this.serialize(right)))
    }

    public before(right: Date): Criteria {
        return new Criteria(StringBuilderVisitor.ofString(this.field, Methods.BEFORE, this.serialize(right)))
    }

    public after(right: Date): Criteria {
        return new Criteria(StringBuilderVisitor.ofString(this.field, Methods.AFTER, this.serialize(right)))
    }

    public memberOf(right: List<Date>): Criteria {
        return new Criteria(
            StringBuilderVisitor.ofStringList(this.field, Methods.MEMBER_OF, this.serializeList(right)),
        )
    }
}
