import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'counters' })
export class Counter {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  value: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
