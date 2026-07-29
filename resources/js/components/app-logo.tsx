export default function AppLogo() {
    return (
        <>
            <div className="flex h-9 w-14 items-center justify-center rounded-md bg-white p-1 ring-1 ring-hod-line">
                <img
                    src="/logo.png"
                    alt="Scented Muse"
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-black text-hod-navy">
                    Scented Muse
                </span>
                <span className="truncate text-xs font-medium text-hod-muted">
                    Admin
                </span>
            </div>
        </>
    );
}
