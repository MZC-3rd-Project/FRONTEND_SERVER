import { Loader2, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from "@/domains/client/address/query/useAddressQueries";

function AddressesPage() {
    const { data: addresses, isLoading, isError, error } = useAddresses();
    const deleteMutation = useDeleteAddress();
    const setDefaultMutation = useSetDefaultAddress();

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

            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}

            {isError && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    배송지를 불러오지 못했습니다. {error?.message ?? "잠시 후 다시 시도해 주세요."}
                </div>
            )}

            {!isLoading && !isError && addresses?.length === 0 && (
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    등록된 배송지가 없습니다. 새 배송지를 추가해 보세요.
                </div>
            )}

            {!isLoading && !isError && addresses?.length > 0 && (
                <section className="space-y-3">
                    {addresses.map((address) => (
                        <Card key={address.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {address.deliveryName}
                                    {address.isDefault && (
                                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                            기본
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm text-muted-foreground">
                                <p>
                                    {address.recipientName} · {address.recipientPhone}
                                </p>
                                <p>
                                    ({address.zipcode}) {address.fullAddress}
                                </p>
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" className="rounded-full px-4">
                                        수정
                                    </Button>
                                    {!address.isDefault && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full px-4"
                                            disabled={setDefaultMutation.isPending}
                                            onClick={() => setDefaultMutation.mutate(address.id)}
                                        >
                                            기본 설정
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full px-4 text-destructive hover:text-destructive"
                                        disabled={deleteMutation.isPending}
                                        onClick={() => deleteMutation.mutate(address.id)}
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}
        </div>
    );
}

export default AddressesPage;
