aws dynamodb create-table \
    --table-name Boards \
    --attribute-definitions AttributeName=UUID, AttributeType=S
        AttributeName=Note,AttributeType=S \
    --key-schema \
        AttributeName=UUID,KeyType=HASH \
        AttributeName=Note,KeyType=RANGE \
    --endpoint-url "http://localhost:4566"\
--provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5