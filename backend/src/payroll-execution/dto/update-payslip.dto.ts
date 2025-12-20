
export class UpdatePayslipDto {
    earningsDetails?: {
        baseSalary?: number;
        allowances?: any;
        bonuses?: any;
        benefits?: any;
        refunds?: any;
    };
    deductionsDetails?: {
        taxes?: any;
        insurances?: any;
        penalties?: any;
    };
}
