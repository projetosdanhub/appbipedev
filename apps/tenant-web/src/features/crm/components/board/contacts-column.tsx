import { Droppable, Draggable } from "@hello-pangea/dnd";
import { CrmContact } from "@bipesend/contracts";
import { User, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface ContactsColumnProps {
  contacts: CrmContact[];
}

export function ContactsColumn({ contacts }: ContactsColumnProps) {
  return (
    <div className="flex flex-col w-[320px] shrink-0 bg-white dark:bg-[#0F172A] border-r-2 border-dashed border-[#E2E8F0] dark:border-[#1E293B] h-full relative group">
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-gradient-to-r from-[#F8FAFC] to-white dark:from-[#1E293B] dark:to-[#0F172A]">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full bg-slate-400" 
          />
          <h3 className="font-bold text-[14px] text-[#0F172A] dark:text-white uppercase tracking-wider truncate">
            Entrada / Inbox
          </h3>
          <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] text-[11px] font-bold rounded-full ml-1">
            {contacts.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId="contacts-inbox" isDropDisabled={true}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar transition-colors ${
              snapshot.isDraggingOver ? "bg-[#F8FAFC] dark:bg-[#1E293B]/50" : "bg-[#F8FAFC]/50 dark:bg-[#0B1120]/50"
            }`}
          >
            {contacts.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-[13px] text-slate-500 italic text-center px-4">
                Nenhum novo contato aguardando.
              </div>
            ) : (
              contacts.map((contact, index) => (
                <Draggable key={contact.id} draggableId={`contact-${contact.id}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group/card flex flex-col p-4 bg-white dark:bg-[#0F172A] border rounded-[12px] shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                        snapshot.isDragging 
                          ? "border-[#0A74FF] shadow-lg ring-2 ring-[#0A74FF]/20 rotate-2 z-50" 
                          : "border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1] dark:hover:border-[#475569]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs shrink-0">
                              {contact.name.substring(0, 2).toUpperCase()}
                           </div>
                           <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-white leading-tight break-words">
                             {contact.name}
                           </h4>
                        </div>
                      </div>

                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-1">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F1F5F9] dark:border-[#1E293B]">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Novo contato</span>
                        </div>
                        <span className="text-[10px] font-medium text-[#94A3B8] dark:text-[#64748B]">
                          {format(new Date(contact.createdAt), "dd MMM")}
                        </span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
