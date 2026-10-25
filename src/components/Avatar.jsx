export default function Avatar({ name, color, online = false, small = false, photo }) {
  const initials = name?.split(/\s+/).slice(0, 2).map((part) => part[0]).join("") || "?";
  return (
    <span className={`avatar${small ? " avatar-small" : ""}`} style={{ "--avatar-color": color ?? "#8793a8" }}>
      {photo ? <img src={photo} alt="" /> : initials}
      {online && <i className="online-dot" aria-label="Online" />}
    </span>
  );
}
