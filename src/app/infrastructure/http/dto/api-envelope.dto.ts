export interface ApiEnvelope<TData = unknown> {
  statusCode: number;
  message: string;
  success: boolean | null;
  data: TData | null;
}
