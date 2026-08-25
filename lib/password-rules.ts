/**
 * パスワードの条件。入力欄の下に一覧で出し、達成状況をその場で示す前提。
 * 検証は足りない条件をまとめて返す — 1つ直すたびに次の条件を告げられると、
 * 何度も入力し直すことになるため。
 */
export const PASSWORD_RULES = [
  { label: "8文字以上", test: (v: string) => v.length >= 8 },
  { label: "小文字", test: (v: string) => /[a-z]/.test(v) },
  { label: "大文字", test: (v: string) => /[A-Z]/.test(v) },
  { label: "数字", test: (v: string) => /[0-9]/.test(v) },
  {
    label: "記号",
    test: (v: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v),
  },
]

/** 満たしていない条件をまとめた文言。すべて満たしていれば null */
export function validatePassword(password: string): string | null {
  const missing = PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label)
  if (missing.length === 0) return null
  return `パスワードに${missing.join("、")}が足りません`
}
