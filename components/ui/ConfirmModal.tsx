import Modal, { ModalBody, ModalFooter, ModalHeader } from "./Modal";

type Props = {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  description,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal>
      <ModalHeader>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase tracking-wide text-zks-gold-bright sm:text-3xl">
          {title}
        </h2>
      </ModalHeader>

      <ModalBody>
        <p className="text-sm leading-relaxed text-zks-text-muted sm:text-base">{description}</p>
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={onCancel} className="zks-btn-outline px-6 py-2.5 text-sm">
          Anuluj
        </button>

        <button type="button" onClick={onConfirm} className="zks-btn-danger px-6 py-2.5 text-sm">
          Usuń
        </button>
      </ModalFooter>
    </Modal>
  );
}
