import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  tenantId?: string;
}
