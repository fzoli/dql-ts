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
import { DateTimeField as DateTimeFieldApi } from "@dqljs/luxon-field";
import { StringBuilderVisitor } from "@dqljs/string-builder";
import { Methods, Criteria } from "@dqljs/query";
import { DateTime } from "luxon";
import { List } from "immutable";

export class DateTimeField implements DateTimeFieldApi {
    constructor(private readonly field: string) {}

    private serialize(value: DateTime): string {
        return value.setZone('UTC').toJSON()!
    }

    private serializeList(value: List<DateTime>): List<string> {
        return value.map((d) => this.serialize(d!)).toList()
    }

    public isNotNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NOT_NULL))
    }

    public isNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NULL))
    }

    public eq(right: DateTime): Criteria {
        return new Criteria(StringBuilderVisitor.ofString(this.field, Methods.EQ, this.serialize(right)))
    }

    public before(right: DateTime): Criteria {
        return new Criteria(StringBuilderVisitor.ofString(this.field, Methods.BEFORE, this.serialize(right)))
    }

    public after(right: DateTime): Criteria {
        return new Criteria(StringBuilderVisitor.ofString(this.field, Methods.AFTER, this.serialize(right)))
    }

    public memberOf(right: List<DateTime>): Criteria {
        return new Criteria(
            StringBuilderVisitor.ofStringList(this.field, Methods.MEMBER_OF, this.serializeList(right)),
        )
    }
}
