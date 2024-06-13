# create k3d cluster
k3d cluster create $CLUSTER_NAME -p "${CLUSTER_HTTP}:80@loadbalancer" -p "${CLUSTER_HTTPS}:443@loadbalancer"
echo "export KUBECONFIG=\"$(k3d kubeconfig write gws)\"" >> ~/.bashrc

kubectl apply -f k8s/coredns.yaml
kubectl apply -f k8s/coredns-custom.yaml

helm repo add jetstack https://charts.jetstack.io --force-update
helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set installCRDs=true
kubectl apply -f k8s/cluster-selfsigned-issuer.yaml
kubectl apply -f k8s/http-to-https-middleware.yaml

helm repo add mittwald https://helm.mittwald.de
helm repo update
helm upgrade --install kubernetes-replicator mittwald/kubernetes-replicator
kubectl apply -f k8s/stars-cert-src.yaml

# install k8s dashboard
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard

kubectl create sa kube-ds-admin -n kube-system
kubectl create clusterrolebinding kube-ds-admin-role-binding --clusterrole=admin --user=system:serviceaccount:kube-system:kube-ds-admin

# install sqlx-cli
cargo install sqlx-cli

# create .env file
cp .env.example .env

# add postgres connection trust permitions for IPv4 and IPv6
IPv4_TRUST_PERM="host    all             all             127.0.0.1/32            trust"
IPv6_TRUST_PERM="host    all             all             ::1/128                 trust"
echo $IPv4_TRUST_PERM | sudo tee -a /etc/postgresql/16/main/pg_hba.conf
echo $IPv6_TRUST_PERM | sudo tee -a /etc/postgresql/16/main/pg_hba.conf

# start postgres service
sudo service postgresql start

# create database
sqlx database reset --source ./api/migrations/ -y

# install web dependecies
pnpm i