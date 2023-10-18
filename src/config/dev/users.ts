import { type User } from '../../security/auth/service/user.service.js';
import { config } from '../app.js';

const { passwordEncoded } = config.auth; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
const password =
    (passwordEncoded as string | undefined) ?? '!!! To Be Changed !!!';

/**
 * Ein JSON-Array der Benutzerdaten mit den vorhandenen Rollen.
 * Nicht Set, weil es dafür keine Suchfunktion gibt.
 */
export const users: User[] = [
    {
        userId: 1,
        username: 'admin',
        password,
        email: 'admin@acme.com',
        roles: ['admin', 'fachabteilung'],
    },
    {
        userId: 2,
        username: 'adriana.alpha',
        password,
        email: 'adriana.alpha@acme.com',
        roles: ['admin', 'fachabteilung'],
    },
    {
        userId: 3,
        username: 'alfred.alpha',
        password,
        email: 'alfred.alpha@acme.com',
        roles: ['fachabteilung'],
    },
    {
        userId: 4,
        username: 'antonia.alpha',
        password,
        email: 'antonia.alpha@acme.com',
        roles: ['fachabteilung'],
    },
    {
        userId: 5,
        username: 'dirk.delta',
        password,
        email: 'dirk.delta@acme.com',
        roles: ['kunde'],
    },
    {
        userId: 6,
        username: 'emilia.epsilon',
        password,
        email: 'emilia.epsilon@acme.com',
        roles: ['kunde'],
    },
];
