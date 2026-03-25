import { MapPin, Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AddressCard({ address, onEdit, onDelete, onSetDefault, isSettingDefault }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{address.deliveryName}</span>
                    {address.isDefault && (
                        <Badge className="rounded-full text-[11px] font-semibold shrink-0">기본</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{address.fullAddress}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full px-4"
                        onClick={() => onEdit(address)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        수정
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full px-4 text-destructive hover:text-destructive"
                        onClick={() => onDelete(address.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        삭제
                    </Button>
                    {!address.isDefault && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full px-4"
                            onClick={() => onSetDefault(address.id)}
                            disabled={isSettingDefault}
                        >
                            <Star className="h-3.5 w-3.5" />
                            기본 설정
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default AddressCard;
