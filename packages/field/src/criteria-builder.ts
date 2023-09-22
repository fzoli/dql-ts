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
import { Criteria } from "./criteria";
import { Criterias } from "./criterias";
import { List } from "immutable";

/**
 * Convenient builder to map UI model to Criteria with a null-safe manner.
 */
export class CriteriaBuilder {

    private readonly filters: Criteria[] = [];

    public static builder(): CriteriaBuilder {
        return new CriteriaBuilder();
    }

    build(): Criteria | undefined {
        return Criterias.allOf(List.of(...this.filters));
    }

    addString(fn: (value: string) => Criteria, value?: string | null): this {
        if (value) { // NOT(null or undefined or empty)
            this.filters.push(fn(value));
        }
        return this;
    }

    addStringList(fn: (value: List<string>) => Criteria, value?: List<string> | null): this {
        if (value !== undefined && value !== null && !value.isEmpty()) {
            this.filters.push(fn(value.filter(v=> !!v)));
        }
        return this;
    }

    addNumber(fn: (value: number) => Criteria, value?: number): this {
        if (value !== undefined && value !== null) {
            this.filters.push(fn(value));
        }
        return this;
    }

    addNumberList(fn: (value: List<number>) => Criteria, value?: List<number> | null): this {
        if (value !== undefined && value !== null && !value.isEmpty()) {
            this.filters.push(fn(value));
        }
        return this;
    }

    addBoolean(fn: (value: boolean) => Criteria, value?: boolean | null): this {
        if (value !== undefined && value !== null) {
            this.filters.push(fn(value));
        }
        return this;
    }

    addEnum<T>(fn: (value: T) => Criteria, value?: T | null): this {
        if (value !== undefined && value !== null) {
            this.filters.push(fn(value));
        }
        return this;
    }

    addDate(fn: (value: Date) => Criteria, value?: Date | null): this {
        if (value !== undefined && value !== null) {
            this.filters.push(fn(value));
        }
        return this;
    }

}
