import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExceptionsService } from '../services/exceptions.service';

@Injectable()
export class ExceptionEscalationCron {
    constructor(private readonly exceptionsService: ExceptionsService) {}

    // Runs every day at 2 AM
    @Cron('0 2 * * *')
    async handleEscalation() {
        /**
         * Example payroll cut-off:
         * 25th of the current month at 23:59
         */
        const now = new Date();
        const cutoff = new Date(
            now.getFullYear(),
            now.getMonth(),
            25,
            23,
            59,
            59,
        );

        if (now <= cutoff) return;

        await this.exceptionsService.escalatePendingBeforeCutoff(cutoff);
    }
}
