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
import { uuid, UuidField as UuidFieldApi } from "@dqljs/field";
import { Criteria } from "./criteria";
import { StringBuilderVisitor } from "@dqljs/string-builder";
import { Methods } from "./methods";
import { List } from "immutable";

export class UuidField implements UuidFieldApi {
    constructor(private readonly field: uuid) {}

    public isNotNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NOT_NULL))
    }

    public isNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NULL))
    }

    public eq(right: uuid): Criteria {
        return new Criteria(StringBuilderVisitor.ofString(this.field, Methods.EQ, right))
    }

    public memberOf(right: List<uuid>): Criteria {
        return new Criteria(StringBuilderVisitor.ofStringList(this.field, Methods.MEMBER_OF, right))
    }
}