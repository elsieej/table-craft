import { MOCK_USERS } from "../data/user.data";
import { User } from "../types/user.type";

export type FetchUserParams = {
    page: number;
    perPage: number;
    search?: string;
    role?: string;
    roleOp?: string;
    permissions?: string[];
}

export type FetchUserResponse = {
    data: User[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
    }
}

const MOCK_DELAY_MS = 500;

export async function fetchUsers(params: FetchUserParams): Promise<FetchUserResponse> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    let filtered = [...MOCK_USERS];

    if (params.search?.trim()) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(q)
        );
    }

    if (params.role) {
        filtered = filtered.filter(user => user.role === params.role);
    }

    if (params.permissions) {
        filtered = filtered.filter(user =>
            params.permissions?.some(permission => user.permissions.includes(permission))
        );
    }

    if (params.roleOp) {
        filtered = filtered.filter(user => user.role === params.roleOp);
    }

    const total = filtered.length;
    const lastPage = Math.ceil(total / params.perPage) || 1;
    const start = (params.page - 1) * params.perPage;
    const end = Math.min(start + params.perPage, total);
    const data = filtered.slice(start, end);

    return {
        data,
        meta: {
            current_page: params.page,
            last_page: lastPage,
            per_page: params.perPage,
            total,
            from: total > 0 ? start + 1 : undefined,
            to: total > 0 ? end : undefined,
        },
    }
}
