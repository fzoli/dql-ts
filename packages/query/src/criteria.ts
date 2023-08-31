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
import { Criteria as CriteriaApi } from "@dqljs/field";
import { Op, StringBuilderVisitor, StringBuilderVisitorProvider } from "@dqljs/string-builder";
import { BooleanField } from "./boolean-field";
import { StringFactory } from "@dqljs/string-builder/dist/string-factory";

export class Criteria implements CriteriaApi, StringBuilderVisitorProvider {
    public static toDqlString(criteria: CriteriaApi): string {
        return Criteria.of(criteria).createQuery()
    }

    private static of(criteria: CriteriaApi): Criteria {
        if (criteria instanceof BooleanField) {
            return criteria.isTrue()
        }
        if (criteria instanceof Criteria) {
            return criteria
        }
        throw Error('Not a DQL criteria')
    }

    constructor(private readonly visitor: StringBuilderVisitor) {}

    public createQuery(): string {
        return StringFactory.create(this)
    }

    public getStringBuilderVisitor(): StringBuilderVisitor {
        return this.visitor
    }

    public not(): CriteriaApi {
        return new Criteria(this.visitor.not())
    }

    public and(right: CriteriaApi): CriteriaApi {
        return new Criteria(StringBuilderVisitor.ofOp(this.visitor, Op.AND, this.cast(right).visitor))
    }

    public or(right: CriteriaApi): CriteriaApi {
        return new Criteria(StringBuilderVisitor.ofOp(this.visitor, Op.OR, this.cast(right).visitor))
    }

    private cast(right: CriteriaApi): Criteria {
        return Criteria.of(right)
    }
}
