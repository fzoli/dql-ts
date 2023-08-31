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
import { EnumField as EnumFieldApi } from "@dqljs/field";
import { Criteria } from "./criteria";
import { StringBuilderVisitor } from "@dqljs/string-builder";
import { List } from "immutable";
import { Methods } from "./methods";

export class EnumField<T> implements EnumFieldApi<T> {
    constructor(private readonly field: string, private readonly serializer: (value: T) => string) {}

    private serialize(value: T): string {
        return this.serializer(value)
    }

    private serializeList(value: List<T>): List<string> {
        return value.map((d) => this.serialize(d!)).toList()
    }

    public isNotNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NOT_NULL))
    }

    public isNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NULL))
    }

    public eq(right: T): Criteria {
        return new Criteria(StringBuilderVisitor.ofString(this.field, Methods.EQ, this.serialize(right)))
    }

    public memberOf(right: List<T>): Criteria {
        return new Criteria(
            StringBuilderVisitor.ofStringList(this.field, Methods.MEMBER_OF, this.serializeList(right)),
        )
    }
}
