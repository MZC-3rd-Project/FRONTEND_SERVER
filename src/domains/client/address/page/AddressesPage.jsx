import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shippingAddresses } from "@/domains/client/order/mock/orderData.js";

function AddressesPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Shipping Addresses</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">배송지 관리</h2>
                <p className="mt-2 text-sm text-muted-foreground">자주 쓰는 배송지를 등록/수정해서 주문서 작성 시간을 줄일 수 있습니다.</p>
            </section>

            <div className="flex justify-end">
                <Button className="rounded-full px-5">
                    <Plus className="h-4 w-4" />
                    새 배송지 추가
                </Button>
            </div>

            <section className="space-y-3">
                {shippingAddresses.map((address) => (
                    <Card key={address.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4 text-primary" />
                                {address.label}
                                {address.isDefault && (
                                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                        기본
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm text-muted-foreground">
                            <p>
                                {address.receiver} · {address.phone}
                            </p>
                            <p>
                                ({address.zipCode}) {address.address1} {address.address2}
                            </p>
                            <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" className="rounded-full px-4">
                                    수정
                                </Button>
                                {!address.isDefault && (
                                    <Button size="sm" variant="outline" className="rounded-full px-4">
                                        기본 설정
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}

export default AddressesPage;
