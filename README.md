# Construir o reconstruir la imagen
docker build -t uteq-devops-assessment .

# Ejecutar
docker run -p 8082:8082 uteq-devops-assessment