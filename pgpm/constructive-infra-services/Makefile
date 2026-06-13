EXTENSION   = constructive-infra-services
EXTVERSION  = $(shell grep -m 1 '"version"' package.json | sed 's/[^0-9.]//g')

DATA        = $(wildcard sql/*--*.sql)
EXTRA_CLEAN = sql/$(EXTENSION)--$(EXTVERSION).sql

PG_CONFIG  ?= pg_config

all: sql/$(EXTENSION)--$(EXTVERSION).sql

sql/$(EXTENSION)--$(EXTVERSION).sql: $(sort $(wildcard deploy/**/*.sql))
	@mkdir -p sql
	cat $^ > $@

PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)
