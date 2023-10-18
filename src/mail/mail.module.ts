import { MailService } from './mail.service.js';
import { Module } from '@nestjs/common';

/**
 * Das Modul besteht aus Services für Mail.
 * @packageDocumentation
 */

/**
 * Die dekorierte Modul-Klasse mit den Service-Klassen.
 */
@Module({
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
