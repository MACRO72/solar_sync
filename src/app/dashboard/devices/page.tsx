"use client";
import { DevicesMap } from "@/components/dashboard/devices-map";
import { DevicesTable } from "@/components/dashboard/devices-table";
import { MyDevicesPanel } from "@/components/dashboard/my-devices-panel";

export default function DevicesPage() {
    return (
        <div className="space-y-6">
            <MyDevicesPanel />
            <DevicesTable />
            <DevicesMap />
        </div>
    )
}
