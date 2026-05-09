bash:
	docker compose exec app bash

logs:
	docker compose logs -f

up:
	docker compose up -d

down:
	docker compose down

node:
	docker compose run --rm node sh

node-logs:
	docker compose logs -f node

npm-install:
	docker compose run --rm node npm install

npm-dev:
	docker compose up node

npm-build:
	docker compose run --rm node npm run build