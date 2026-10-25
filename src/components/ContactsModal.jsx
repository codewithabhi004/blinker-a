import { useState } from "react";
import { MessageSquare, Phone, Plus, Search, UserCheck, UserPlus, X } from "lucide-react";
import Avatar from "./Avatar.jsx";

export default function ContactsModal({ contacts, onSelectContact, onAddContact, onStartCall, onClose }) {
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("+91 ");
  const [newCity, setNewCity] = useState("");

  const filtered = contacts.filter((c) => {
    const q = query.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.city && c.city.toLowerCase().includes(q));
  });

  const handleCreateContact = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact = {
      id: "c-" + Date.now(),
      name: newName.trim(),
      phone: newPhone.trim(),
      city: newCity.trim() || "India",
      status: "Available on Blinker-a 🇮🇳",
      avatarUrl: null,
      color: "#84a9ff",
      online: true
    };

    onAddContact(newContact);
    setShowAddForm(false);
    setNewName("");
    setNewPhone("+91 ");
    setNewCity("");
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal contacts-modal-card">
        <div className="modal-header">
          <div>
            <span className="eyebrow">PHONE DIRECTORY</span>
            <h2>Contacts ({contacts.length})</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Search contacts */}
        <div className="contacts-search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by name, +91 phone, or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="clear-search-btn" onClick={() => setQuery("")}><X size={14} /></button>
          )}
        </div>

        {/* Add New Contact Trigger / Form */}
        {showAddForm ? (
          <form className="add-contact-form" onSubmit={handleCreateContact}>
            <div className="add-contact-head">
              <strong>Add New Contact</strong>
              <button type="button" className="icon-button" onClick={() => setShowAddForm(false)}><X size={15} /></button>
            </div>
            <div className="field-group">
              <label>Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="field-group">
              <label>Indian Mobile Number (+91)</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
              />
            </div>
            <div className="field-group">
              <label>City / Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Delhi, Mumbai, Lucknow"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
            </div>
            <button type="submit" className="primary-button">
              Save & Start Chat
            </button>
          </form>
        ) : (
          <div className="contacts-action-bar">
            <button
              type="button"
              className="new-contact-row"
              onClick={() => setShowAddForm(true)}
            >
              <div className="new-contact-icon">
                <UserPlus size={18} />
              </div>
              <div className="new-contact-text">
                <strong>New Contact</strong>
                <small>Add Indian phone number (+91) to chat</small>
              </div>
            </button>
          </div>
        )}

        {/* Contacts list */}
        <div className="contacts-scroll-list">
          <div className="section-label">CONTACTS ON BLINKER-A</div>
          {filtered.map((contact) => (
            <div key={contact.id} className="contact-list-item">
              <Avatar
                name={contact.name}
                color={contact.color}
                online={contact.online}
                photo={contact.avatarUrl}
              />
              <div className="contact-info" onClick={() => onSelectContact(contact)}>
                <strong>{contact.name}</strong>
                <small>{contact.phone} {contact.city && `· ${contact.city}`}</small>
                {contact.status && <span className="contact-status-text">"{contact.status}"</span>}
              </div>
              <div className="contact-actions">
                <button
                  type="button"
                  className="icon-button"
                  title="Voice Call"
                  onClick={() => onStartCall(contact, false)}
                >
                  <Phone size={16} />
                </button>
                <button
                  type="button"
                  className="contact-chat-btn"
                  onClick={() => onSelectContact(contact)}
                >
                  <MessageSquare size={14} />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="empty-state">
              <p>No contacts found matching "{query}".</p>
              <button
                type="button"
                className="text-button"
                onClick={() => setShowAddForm(true)}
              >
                + Add "{query}" as new contact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
