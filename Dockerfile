FROM electronuserland/builder:wine as builder

RUN git clone https://github.com/cpsamtec/virtuin.git
WORKDIR /project/virtuin/
RUN yarn && yarn run bootstrap && yarn run build
RUN yarn run package:win
RUN yarn run package:linux
RUN yarn run package:mac

FROM electronuserland/builder:wine 
RUN git clone https://github.com/cpsamtec/virtuin.git
COPY --from=builder /project/virtuin/packages/virtuingui2/release release
WORKDIR /project/virtuin/

