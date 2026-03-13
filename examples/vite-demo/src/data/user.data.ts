import { faker } from '@faker-js/faker'
import type { User } from '../types/user.type'

const ROLES = ['Admin', 'Editor', 'Viewer'] as const
const PERMISSION_SETS = [
    ['read' as const],
    ['read', 'write' as const],
    ['read', 'write', 'delete' as const],
]

export function createMockUser(id: string): User {
    return {
        id,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: faker.helpers.arrayElement(ROLES),
        permissions: faker.helpers.arrayElement(PERMISSION_SETS),
        isActive: faker.datatype.boolean(),
        createdAt: faker.date.past({ years: 2 }).toISOString().slice(0, 10),
    }
}

export function generateMockUsers(count: number): User[] {
    return Array.from({ length: count }, (_, index) => createMockUser(`user_${index + 1}`))
}

// Generate 100 mock users
export const MOCK_USERS = generateMockUsers(100)
