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
import { BooleanField as BooleanFieldApi, Criteria as CriteriaApi } from "@dqljs/field";
import { StringBuilderVisitor, StringBuilderVisitorProvider } from "@dqljs/string-builder";
import { StringFactory } from "@dqljs/string-builder/dist/string-factory";
import { Criteria } from "./criteria";
import { Methods } from "./methods";

export class BooleanField implements BooleanFieldApi, StringBuilderVisitorProvider {
    constructor(private readonly field: string) {}

    public createQuery(): string {
        return StringFactory.create(this)
    }

    public getStringBuilderVisitor(): StringBuilderVisitor {
        return this.isTrue().getStringBuilderVisitor()
    }

    public not(): CriteriaApi {
        return this.isFalse()
    }

    public and(right: CriteriaApi): CriteriaApi {
        return this.isTrue().and(right)
    }

    public or(right: CriteriaApi): CriteriaApi {
        return this.isTrue().or(right)
    }

    public isFalse(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_FALSE))
    }

    public isNotNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NOT_NULL))
    }

    public isNull(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_NULL))
    }

    public isTrue(): Criteria {
        return new Criteria(StringBuilderVisitor.ofUnary(this.field, Methods.IS_TRUE))
    }
}
