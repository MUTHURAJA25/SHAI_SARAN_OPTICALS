FROM nginx:1.25-alpine

COPY dist/ /usr/share/nginx/html/
COPY pages/ /usr/share/nginx/html/pages/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

