import { DateTimeField } from "@dqljs/luxon-query";
import { EnumField, StringField } from "@dqljs/query";
import { FilterFunction } from "@dqljs/field";

export enum UserType {
    ADMIN = 'ADMIN',
    GENERAL = 'GENERAL',
}

export class UserFilterField {
    readonly name: StringField
    readonly creationTime: DateTimeField
    readonly type: EnumField<UserType>
    constructor(prefix?: string) {
        prefix = prefix ? prefix : ''
        this.name = new StringField(prefix + 'name')
        this.creationTime = new DateTimeField(prefix + 'creationTime')
        this.type = new EnumField(prefix + 'type', (value) => value)
    }
}

export interface UserQueryRequest {
    filter?: FilterFunction<UserFilterField>
}
