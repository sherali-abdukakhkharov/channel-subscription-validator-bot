import { InlineKeyboard } from 'grammy';

export function getHelpKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('❓ Savollar', 'faq_callback')
    .row()
    .text('🆘 Qo\'llab-quvvatlash', 'contact_support')
    .row()
    .text('📖 Darslik', 'help_tutorial');
}
