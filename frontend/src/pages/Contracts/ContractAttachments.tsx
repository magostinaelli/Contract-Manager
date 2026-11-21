import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  downloadAttachment,
  getAttachments,
  uploadAttachment,
} from "../../services/contractAttachmentService";
import type { ContractAttachment } from "../../types/contractAttachment";
import styles from "./ContractAttachments.module.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });

interface ContractAttachmentsProps {
  contractId: number;
  contractTitle: string;
  onClose: () => void;
}

export const ContractAttachments = ({
  contractId,
  contractTitle,
  onClose,
}: ContractAttachmentsProps) => {
  const [attachments, setAttachments] = useState<ContractAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setAttachments(await getAttachments(contractId));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los adjuntos.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [contractId]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Solo se permiten archivos PDF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("El archivo supera el tamaño máximo de 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      await uploadAttachment(contractId, file);
      setAttachments(await getAttachments(contractId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo subir el archivo.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: ContractAttachment) => {
    try {
      setDownloadingId(attachment.id);
      setError("");
      await downloadAttachment(contractId, attachment);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo descargar el archivo.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-attachments-title"
      >
        <header className={styles.header}>
          <div>
            <h2 id="contract-attachments-title">Adjuntos</h2>
            <p className={styles.subtitle}>{contractTitle}</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className={styles.uploadRow}>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Subiendo..." : "+ Adjuntar PDF"}
          </button>

          <span className={styles.hint}>Solo PDF, máximo 10 MB</span>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className={styles.empty}>Cargando adjuntos...</p>
        ) : attachments.length === 0 ? (
          <p className={styles.empty}>
            Este contrato todavía no tiene adjuntos.
          </p>
        ) : (
          <ul className={styles.list}>
            {attachments.map((attachment) => (
              <li key={attachment.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.fileName}>
                    {attachment.fileName}
                  </span>
                  <span className={styles.meta}>
                    {formatFileSize(attachment.fileSize)} ·{" "}
                    {attachment.uploadedBy} ·{" "}
                    {formatDateTime(attachment.uploadedAt)}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.downloadButton}
                  onClick={() => handleDownload(attachment)}
                  disabled={downloadingId === attachment.id}
                >
                  {downloadingId === attachment.id
                    ? "Descargando..."
                    : "Descargar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};