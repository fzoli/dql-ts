import { UserFilterField, UserQueryRequest } from "./usage.model";
import { toOptionalFilter } from "@dqljs/query";

export class UserService {
    private readonly filterField = new UserFilterField()

    /**
     * In a real service the result would be a User list.
     */
    public listUsers(request: UserQueryRequest): string {
        const filter: string | undefined = toOptionalFilter(this.filterField, request.filter)
        // In a real service we would pass the filter to the client.
        return filter
    }
}
