# API — Gestão de Hospedagens

Sistema de gestão de agenda dos imóveis Artezian. Use esta API para consultar disponibilidade e registrar reservas confirmadas.

**URL do Apps Script:**
```
https://script.google.com/macros/s/AKfycbyxo7qXWyDyChrFJMjpLHNLUqhrLzhXticGpusSQTOxKc0_wFUtEZMqmJqe7rrEgcA/exec
```

---

## Consultar todas as reservas

```
GET ?action=getAll
```

Retorna todas as entradas (manuais + Stays) com campos: `id`, `propertyId`, `type`, `checkIn`, `checkOut`, `guestName`, `totalValue`, `paymentMethod`, `paidValue`, `pendingValue`, `notes`, `source`.

---

## Registrar nova reserva

```
GET ?action=add&data=ENCODED_JSON
```

O campo `data` deve ser um JSON URL-encoded com os campos abaixo:

| Campo | Tipo | Exemplo |
|-------|------|---------|
| `id` | string único | `"res_" + Date.now()` |
| `propertyId` | string | `"casa-tremura"` |
| `type` | `"reserva"` ou `"bloqueio"` | `"reserva"` |
| `checkIn` | `YYYY-MM-DD` | `"2026-07-10"` |
| `checkOut` | `YYYY-MM-DD` | `"2026-07-14"` |
| `guestName` | string | `"João Silva"` |
| `totalValue` | número | `4800` |
| `paymentMethod` | string | `"pix"` |
| `paidValue` | número | `1440` |
| `pendingValue` | número | `3360` |
| `notes` | string | `"Reserva via WhatsApp"` |

**Exemplo em JavaScript:**
```javascript
const entry = {
  id: 'res_' + Date.now(),
  propertyId: 'casa-tremura',
  type: 'reserva',
  checkIn: '2026-07-10',
  checkOut: '2026-07-14',
  guestName: 'João Silva',
  totalValue: 4800,
  paymentMethod: 'pix',
  paidValue: 1440,
  pendingValue: 3360,
  notes: 'Reserva via WhatsApp'
};

const url = SCRIPT_URL + '?action=add&data=' + encodeURIComponent(JSON.stringify(entry));
fetch(url).then(r => r.json()).then(console.log);
```

---

## Mapeamento de imóveis

Apenas os imóveis gerenciados diretamente pela Artezian têm `propertyId` no sistema:

| Imóvel | propertyId |
|--------|-----------|
| Casa do Tremura (GF02J) | `casa-tremura` |
| Casa do Euller (GG06J) | `casa-euller` |
| Casa da Moana (GF06J) | `casa-moana` |
| Casa do John (GG08J) | `casa-john` |
| Casa da Laureana (GF04J) | `casa-laureana` |
| Apto da Jessilene (HA02J) | `apto-jessilene` |
| Apto da Isa (DS06J) | `apto-isa` |

> Varandas de Porto, Mont Carmelo e Condomínio do Max são gerenciados pela Stays — as reservas desses imóveis ficam lá.

---

## Verificar disponibilidade

Não existe endpoint de disponibilidade — consulte `getAll` e filtre localmente:

```javascript
// Verifica se um imóvel está disponível em um período
function isAvailable(entries, propertyId, checkIn, checkOut) {
  return !entries.some(e =>
    e.propertyId === propertyId &&
    e.checkIn < checkOut &&
    e.checkOut > checkIn
  );
}
```

---

## Quando usar

- Ao confirmar uma reserva (fase 3 do fluxo — lead diz "fechado", "quero reservar", "como pago")
- Para checar se uma data está ocupada antes de confirmar disponibilidade ao lead
