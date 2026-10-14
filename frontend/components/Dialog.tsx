"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./Icon";

export function Dialog({
  title,
  children,
  onClose,
  locked = false,
  focusClose = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  locked?: boolean;
  focusClose?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>("[data-initial-focus]")?.focus();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      className="dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (!locked) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !locked) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          data-initial-focus={focusClose || undefined}
          onClick={onClose}
          disabled={locked}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
