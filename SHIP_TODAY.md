# 今天 17:00 前你必须做完的事

截止日期：**2026-08-17 13:00 PT**（北京时间 **8 月 18 日 04:00**）。

代码已经在 `mossdesk/`。评委要的是 **真实第三方收入 + 线上 Gemini 决策日志**，仓库本身拿不到大奖。

## 1. 注册并加入黑客松

1. https://xprize.devpost.com/ 登录 Devpost  
2. Join Hackathon  
3. 准备 GitHub（public，或 private 并邀请 `testing@devpost.com` 和 `judging@hacker.fund`）

## 2. 密钥

```bash
cd mossdesk
cp .env.example .env.local
```

- [Gemini API key](https://aistudio.google.com/apikey) → `GEMINI_API_KEY`  
- 有 GCP 就部署 Cloud Run（规则要求至少一个 Google Cloud 产品）  
- 要报收入就必须上 Stripe：`STRIPE_SECRET_KEY` + webhook `/api/stripe/webhook`

## 3. 部署

```bash
gcloud run deploy mossdesk --source . --region us-central1 --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=...,NEXT_PUBLIC_APP_URL=https://你的服务地址
```

把 URL 写进 Devpost 的 Website / Testing instructions。

## 4. 真实客户（这一步决定能不能进评审）

规则：关联方（自己、家人、已有客户关系）收入要单独报，**不能算 Total Revenue**。

最低目标：找 **1 个真正的店主** 付一笔 Desk Sprint（$29+）。用预设案例演示 2 分钟，当场收 Stripe。

不要用「demo payment」按钮报收入。

## 5. 录像 ≤ 3 分钟

按 `VIDEO_SCRIPT.md`：现场跑 job → `/ops` → Stripe。上传 YouTube/Vimeo 公开链接。

## 6. Devpost 粘贴

- 类别：**Small Business Services**  
- 叙述：`NARRATIVE.md`（约 700 词，已是英文）  
- 其他字段：`SUBMISSION.md`  
- 财务：填完的 `P_AND_L.md`  
- Circle 奖金：本次 **不要勾选**（没有 agent 自动打 USDC）

## 7. 证据包

把这些放进仓库 `evidence/` 或 Devpost 附件：

- Stripe 导出  
- `/ops` 截图  
- 客户同意后的姓名/邮箱/电话  
- Cloud Run 服务 URL
