# delete k3d cluster
k3d cluster delete $CLUSTER_NAME

# create k3d cluster 
k3d cluster create $CLUSTER_NAME -p "${CLUSTER_HTTP}:80@loadbalancer" -p "${CLUSTER_HTTPS}:443@loadbalancer"
k3d kubeconfig write gws

kubectl apply -f k8s/coredns.yaml
kubectl apply -f k8s/coredns-custom.yaml

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set installCRDs=true
kubectl apply -f k8s/cluster-selfsigned-issuer.yaml
kubectl apply -f k8s/http-to-https-middleware.yaml

helm upgrade --install kubernetes-replicator mittwald/kubernetes-replicator
kubectl apply -f k8s/stars-cert-src.yaml

helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard

kubectl create sa kube-ds-admin -n kube-system
kubectl create clusterrolebinding kube-ds-admin-role-binding --clusterrole=admin --user=system:serviceaccount:kube-system:kube-ds-admin

# recreate the database
sqlx database reset --source ./api/migrations/ -y -f