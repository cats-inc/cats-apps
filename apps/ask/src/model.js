export const stateLabels = { queued: '已保存', awaiting_assistant: '等待 Grok Bot', unconfirmed: '尚未確認完成', succeeded: '已收到回答' };
export const outcomeLabels = { answered: '已回答', partial: '部分回答', unavailable: '無法取得', empty: '沒有符合的內容' };
export function answerText(question) {
  const response = question.response?.content;
  if (!response) return '';
  const sections = [response.answer];
  if (response.sources.length) sections.push(`來源\n${response.sources.map(source => `${source.title}\n${source.url}`).join('\n\n')}`);
  if (response.limitations) sections.push(`限制\n${response.limitations}`);
  if (response.evidence) sections.push(`查詢依據\n${response.evidence}`);
  return sections.join('\n\n');
}
export function connectionInstruction(url, token) {
  return `請在這次 Grok Bot 對話中，使用 cursor namespace 的 AddMcpServer 工具新增或更新我的 Cats Ask 連線。\nname: cats-ask\nurl: ${url}\nheaders: ${JSON.stringify({ Authorization: `Bearer ${token}` })}\n這是我自己的 Cats Ask 回覆通道。請確認工具可用即可，不要更動 X Connector，也不要列出或讀取其他未指定的資料。`;
}
export function questionInstruction(attempt) {
  return `請使用已連線的 cats-ask MCP 的 cats_get_question 工具讀取這次問題：\n${JSON.stringify({ requestId: attempt.requestId, attemptId: attempt.attemptId, attemptToken: attempt.attemptToken }, null, 2)}\n用這次 Grok Bot 對話中已授權的 X Connector 回答。完成後請用 cats_submit_answer 交回同一個 requestId、attemptId、attemptToken。請交代實際使用的工具、來源與限制；無權限或沒有內容也請回覆。不要更改我的 X Connector 或社群內容。`;
}
