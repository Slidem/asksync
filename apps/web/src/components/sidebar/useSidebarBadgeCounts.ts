import { useUnreadQuestionCount } from "@/questions/hooks/queries";
import { useAttentionItemCounts } from "@/emails/hooks/queries";

export const useSidebarBadgeCounts = () => {
  const { unread: questions } = useUnreadQuestionCount();
  const { counts } = useAttentionItemCounts();
  return { questions, emails: counts.pending };
};
