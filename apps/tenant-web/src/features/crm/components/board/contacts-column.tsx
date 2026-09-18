import { Droppable, Draggable } from "@hello-pangea/dnd";
import { CrmContact } from "@bipesend/contracts";
import { User, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface ContactsColumnProps {
  contacts: CrmContact[];
}

export function ContactsColumn({ contacts }: ContactsColumnProps) {
  return (
    <section className="crm-column crm-contacts-column" aria-labelledby="crm-contacts-inbox">
      <div className="crm-column-header">
        <div className="crm-column-title">
          <span className="crm-stage-dot" aria-hidden="true" />
          <h3 id="crm-contacts-inbox">
            Entrada / Inbox
          </h3>
          <span className="crm-column-count" aria-label={`${contacts.length} contatos`}>
            {contacts.length}
          </span>
        </div>
      </div>

      <Droppable droppableId="contacts-inbox" isDropDisabled={true}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="crm-column-body"
            data-dragging-over={snapshot.isDraggingOver}
          >
            <div className="crm-column-stack">
            {contacts.length === 0 ? (
              <div className="py-6 text-[13px] text-[var(--text-muted)] text-center px-4">
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
                      className="crm-deal-card"
                      data-dragging={snapshot.isDragging}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-[var(--bg-selected)] flex items-center justify-center text-[var(--action-primary)] font-bold text-xs shrink-0">
                              {contact.name.substring(0, 2).toUpperCase()}
                           </div>
                           <h4 className="text-[14px] font-bold text-[var(--text-primary)] leading-tight break-words">
                             {contact.name}
                           </h4>
                        </div>
                      </div>

                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] mb-1">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-default)]">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Novo contato</span>
                        </div>
                        <span className="text-[10px] font-medium text-[var(--text-soft)]">
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
          </div>
        )}
      </Droppable>
    </section>
  );
}
