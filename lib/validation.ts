import { z } from "zod";

export const paydaySchema = z
  .number({ required_error: "給料日を入力してください" })
  .int("整数で入力してください")
  .min(1, "1〜31 の範囲で入力してください")
  .max(31, "1〜31 の範囲で入力してください");

export const amountSchema = z
  .number({ required_error: "金額を入力してください" })
  .gt(0, "0 より大きい金額で入力してください");

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名前は必須です"),
  percent: z.number().min(0).max(100),
  isArchived: z.boolean().default(false),
});

export const categoriesPayloadSchema = z
  .array(categorySchema)
  .superRefine((arr, ctx) => {
    const total = arr.reduce((sum, c) => sum + (c.isArchived ? 0 : c.percent), 0);
    if (total > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `合計が 100% を超えています (現在 ${total}%)`,
      });
    }
  });

export const transactionSchema = z.object({
  id: z.string(),
  categoryId: z.string().nullable().optional(),
  amount: amountSchema,
  occurredAt: z.string(), // ISO
  note: z.string().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

