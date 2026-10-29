// fallow-ignore-file unused-export
import { Slot } from "@radix-ui/react-slot";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type * as React from "react";
import { buttonVariants } from "~/client/components/ui/button";
import { cn } from "~/client/lib/utils";
import { useTranslation } from "~/client/lib/i18n";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			aria-label="pagination"
			data-slot="pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			{...props}
		/>
	);
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />
	);
}

function PaginationItem(props: React.ComponentProps<"li">) {
	return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
	isActive?: boolean;
	asChild?: boolean;
} & React.ComponentProps<"a">;

function PaginationLink({ className, isActive, asChild = false, ...props }: PaginationLinkProps) {
	const Comp = asChild ? Slot : "a";

	return (
		<Comp
			aria-current={isActive ? "page" : undefined}
			data-slot="pagination-link"
			data-active={isActive}
			className={cn(
				buttonVariants({ variant: isActive ? "outline" : "ghost", size: "icon" }),
				"active:scale-[0.96]",
				className,
			)}
			{...props}
		/>
	);
}

function PaginationPrevious({ className, text, ...props }: PaginationLinkProps & { text?: string }) {
	const { t } = useTranslation();
	return (
		<PaginationLink
			aria-label={t("pagination.previousPage")}
			className={cn("w-auto gap-1 px-2.5 sm:pr-3", className)}
			{...props}
		>
			<ChevronLeft />
			<span className="hidden sm:block">{text ?? t("pagination.previous")}</span>
		</PaginationLink>
	);
}

function PaginationNext({ className, text, ...props }: PaginationLinkProps & { text?: string }) {
	const { t } = useTranslation();
	return (
		<PaginationLink
			aria-label={t("pagination.nextPage")}
			className={cn("w-auto gap-1 px-2.5 sm:pl-3", className)}
			{...props}
		>
			<span className="hidden sm:block">{text ?? t("pagination.next")}</span>
			<ChevronRight />
		</PaginationLink>
	);
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
	const { t } = useTranslation();
	return (
		<span
			aria-hidden="true"
			data-slot="pagination-ellipsis"
			className={cn("flex size-9 items-center justify-center text-muted-foreground", className)}
			{...props}
		>
			<MoreHorizontal className="size-4" />
			<span className="sr-only">{t("pagination.morePages")}</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
