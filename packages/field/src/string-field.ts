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
import { LiteralField } from "./literal-field";
import { Criteria } from "./criteria";

export interface StringField extends LiteralField<string> {
    isEmpty(): Criteria
    isNotEmpty(): Criteria
    equalsIgnoreCase(right: string): Criteria
    contains(right: string): Criteria
    containsIgnoreCase(right: string): Criteria
    startsWith(right: string): Criteria
    startsWithIgnoreCase(right: string): Criteria
}
