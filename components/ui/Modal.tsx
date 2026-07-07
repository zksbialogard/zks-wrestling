type Props = {
  children: React.ReactNode;
};

export default function Modal({ children }: Props) {
  return (
    <div className="zks-modal-overlay">
      <div className="zks-modal-panel zks-card zks-card-pad">{children}</div>
    </div>
  );
}
