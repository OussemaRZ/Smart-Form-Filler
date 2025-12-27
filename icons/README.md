# Icônes de l'extension

Pour l'instant, vous devez ajouter manuellement les icônes suivantes :
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Option 1 : Créer vos propres icônes
Utilisez un outil comme GIMP, Photoshop, ou Figma pour créer des icônes carrées.

## Option 2 : Utiliser des icônes temporaires
Vous pouvez temporairement télécharger des icônes gratuites depuis :
- https://www.flaticon.com/
- https://icons8.com/

## Option 3 : Générer avec Python + PIL
```bash
pip install pillow
python3 << 'EOF'
from PIL import Image, ImageDraw

def create_icon(size):
    img = Image.new('RGB', (size, size), color='#4285F4')
    draw = ImageDraw.Draw(img)
    margin = size // 5
    draw.rectangle([margin, margin, size-margin, size-margin],
                   fill='white', outline='#4285F4', width=max(1, size//32))
    return img

for size in [16, 48, 128]:
    create_icon(size).save(f'icon{size}.png')
EOF
```

## Note
L'extension fonctionnera même sans icônes, mais Chrome affichera une icône par défaut.
